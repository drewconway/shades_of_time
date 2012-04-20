# Shades of TIME Project #
==============

This repository contains all of the code and data used to generate the Shades of TIME project.

[http://labs.drewconway.com/time](http://labs.drewconway.com/time)

The process for generating the Shades of TIME required the following steps:

 1. The data set of Time Magazine covers, [downloaded here](http://www.reddit.com/r/datasets/comments/s0fld/all_time_magazine_covers_march_1923_to_march_2012/)
   
 2. Using [OpenCV](http://opencv.willowgarage.com/wiki/) to detect and extract the faces appearing in the magazine covers
   - `time_covers.py`
 3. Using the [Python Image Library](http://www.pythonware.com/products/pil/) to implement the [Peer, at al. (2003)](http://www.lrv.fri.uni-lj.si/~peterp/publications/eurocon03.pdf) skin tone classifier to find the dominant skin tone in each face
   - `skin_tone.py`
 4. Designing a data visualization and exploration tool using [d3.js](http://mbostock.github.com/d3/)
   - `tones.js`
   
   
## License ##

Created by Drew Conway (drew.conway@nyu.edu) on 2012-04-20

Copyright (c) 2012, under the Simplified BSD License.  
For more information on FreeBSD see: [http://www.opensource.org/licenses/bsd-license.php](http://www.opensource.org/licenses/bsd-license.php)
All rights reserved.