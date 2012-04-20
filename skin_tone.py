#!/usr/bin/env python
# encoding: utf-8
"""
skin_tine.py

Description: Detects dominant skin tone in an image

Created by Drew Conway (drew.conway@nyu.edu) on 2012-04-14 
# Copyright (c) 2012, under the Simplified BSD License.  
# For more information on FreeBSD see: http://www.opensource.org/licenses/bsd-license.php
# All rights reserved.
"""

import sys
import os
from PIL import Image
import glob
import re
import json
import datetime
    
def peerClassifier(pix):
    """
    Classifies a pixel as being skin tone by Peer et al. (2003) 
    """
    skin_tone = False
    R, G, B = pix[0], pix[1], pix[2]
    if R > 95 and G > 40 and B > 20:
        if (max(pix) - min(pix)) > 15:
            if abs(R - G) > 15 and R > G and R > B:
                skin_tone = True
    return skin_tone

def skinPixels(img):
    """
    Uses the Peer et al. 2003 formula to classify skin tone colors for image
    Citation: http://www.lrv.fri.uni-lj.si/~peterp/publications/eurocon03.pdf
    """
    size =img.size
    colors = img.getcolors(size[0] * size[1])
    return map(lambda p: [p[0], p[1], peerClassifier(p[1])], colors)    
    
def rgb_to_hex(rgb):
    """
    Converts RGB tuple to a hex string
    """
    return '#%02x%02x%02x' % rgb

def modalSkinTone(image_path):
    """Returns the most frequent RGB value that is classified as a skin tone for a given image, or an RGB of (255,250,250)"""
    img = Image.open(image_path)
    skin_test = skinPixels(img)

    skin_pix = [(a,b) for (a,b,c) in skin_test if c]

    if len(skin_pix) > 0:    
        skin_pix.sort()
        skin_pix.reverse()
        tone_rgb = skin_pix[0][1]
    else:
        tone_rgb = (255,250,250)
    
    return tone_rgb
    
def main():
    # Get all image file names
    data_path = 'faces'
    all_faces = map(lambda f: f, glob.glob(os.path.join(data_path, '*_crop.jpg')))
    
    tones = list()
    for i in all_faces:
        tone_data = modalSkinTone(i)
        d, m, y, n = re.split('[/_\.]', i)[1:-2]
        # Subset only color covers (Oct 3, 1938), the first color cover TIME ran
        if datetime.date(int(y), int(m), int(d)) >= datetime.date(1938,10,3):
            date = y + '-' + m + '-' + d
            if tone_data is not None:
                tones.append({'date': date, 'day': d, 'month': m, 'year': y, 'num': n, 'hexcolor': rgb_to_hex(tone_data), 'rgbcolor': {'R': tone_data[0], 'G': tone_data[1], 'B': tone_data[2]}, 'face_path': i, 'cover_path': 'data/' + d +'_' + m + '_' + y + '.jpg'})
            
        
    # Save skin tone data as JSON
    with open('tones.json', 'wb') as fp:
        json.dump(tones, fp)
        
    print 'Data file created'
            
    
if __name__ == '__main__':
    main()

