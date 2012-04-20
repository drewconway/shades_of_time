#!/usr/bin/env python
# encoding: utf-8
"""
time_covers.py

Description: Identifies which covers contain a face using haar object detections.
            Then, given a face, it calculates a rectangle that contains the face 
            pixels.

Created by Drew Conway (drew.conway@nyu.edu) on 2012-04-13 
# Copyright (c) 2012, under the Simplified BSD License.  
# For more information on FreeBSD see: http://www.opensource.org/licenses/bsd-license.php
# All rights reserved.
"""

import sys, os
import glob
import re
import cv
import PIL

def extractFace(image_path):
    """
    If a face is detected in an image, the face is cropped and saved as a new image, and a rectangle is drawn
    over the area where the face was detected and that is saved as its own image.
    """
    # Handle IO errors, which suck
    try:
        img = cv.LoadImage(image_path)
        io_err = False
    except IOError as e:
        print e
        io_err = True
    
    if not io_err:
    
        # Create a grayscale version of the image
        img_gray = cv.CreateImage(cv.GetSize(img), 8, 1)
        cv.CvtColor(img, img_gray, cv.CV_BGR2GRAY)

        # Equalize image histogram
        cv.EqualizeHist(img_gray, img_gray)

        # Show processed image
        cv.ShowImage('Processed', img_gray)

        # Create storage for detection
        storage = cv.CreateMemStorage(0)
    
        # Train face detector using the Haar cascade file
        cascade = cv.Load('data/haarcascade_frontalface_alt.xml')
        faces = cv.HaarDetectObjects(img_gray, cascade, storage, 1.2, 2, cv.CV_HAAR_DO_CANNY_PRUNING)
    
        # Extract the region of interest detected by the classifier
        if faces:
            date = re.split("[./]", image_path)[1]
            face_count = 0
            for i in faces:
                x = i[0][0]
                y = i[0][1]
                w = i[0][2]
                h = i[0][3]
                
                # Highlight face in original
                cv.Rectangle(img, (x, y), (x+w, y+h), cv.RGB(0, 255, 0), 2)
                
                # Extraqct face for skin tone
                crop = cv.CreateImage((w, h), 8, 3)
                roi = cv.GetSubRect(img, i[0])
                cv.Copy(roi, crop)
                
                # Save images
                highlight_path = "faces/" + date + '_' + str(face_count) + '.jpg'
                crop_path = "faces/" + date + '_' + str(face_count) + '_crop.jpg'
                cv.SaveImage(highlight_path, img)
                cv.SaveImage(crop_path, crop)
                face_count += 1
        else:
            print 'No face detected in: ' + image_path

def main():
    # Get all image file names
    data_path = 'data'
    all_images = map(lambda f: f, glob.glob(os.path.join(data_path, '*.jpg')))
    
    for f in all_images:
        extractFace(f)
        
    print 'All faces extracted.'


if __name__ == '__main__':
    main()
