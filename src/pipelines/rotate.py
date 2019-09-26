import cv2
import os
import sys

#TODO: Increase size of image for non square images
#TODO: Testing - negative values, value > 360? decimal and invalid strings


"""
How to execute pipeline:
python rotate.py <file name or directory name> <Angle or rotation>

"""

pipeline = sys.argv[0]
string = sys.argv[1]   #String to determine file or directory handling
angle = int(sys.argv[2])    # Parameter #1: Angle or rotation 



if os.path.isfile(string):
    path = '/'.join(string.split('/')[0:-1])
    image = cv2.imread(string)
    rows,cols = image.shape[0:-1]
    matrix = cv2.getRotationMatrix2D((cols/2,rows/2),angle,1)
    dst = cv2.warpAffine(image,matrix,(cols,rows))
    cv2.imwrite("{}/{}-rotated-{}.png".format(path,string.split('.')[-2].split('/')[-1],angle),dst)
    print("Done File!")

if os.path.isdir(string):   
    for subdir, dirs, files in os.walk(string):
        for file in files:
            try:
                image = cv2.imread(os.path.join(subdir,file))
                rows,cols = image.shape[0:-1]
                matrix = cv2.getRotationMatrix2D((cols/2,rows/2),angle,1)
                dst = cv2.warpAffine(image,matrix,(cols,rows))
                cv2.imwrite("{}/{}-{}.png".format(subdir,file.split('.')[-2].split('/')[-1],angle),dst)

            except Exception as identifier:
                print("Error:", identifier)
                pass

print("Done Directory!")
