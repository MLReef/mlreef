import cv2
import os
import sys
import argparse

#TODO: Increase size of image for non square images
#TODO: Testing - negative values, value > 360? decimal and invalid strings


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Rotate')
    parser.add_argument('--images-path', action='store', help='path to directory of images')
    parser.add_argument('--angle', action='store', help='angle of rotation')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of rotate.py script ......... \n")    
    params = process_arguments(sys.argv[1:])
    string = params['images_path']
    angle = float(params['angle'])    

    if os.path.isfile(string):
        path = '/'.join(string.split('/')[0:-1])
        image = cv2.imread(string)
        rows,cols = image.shape[0:-1]
        matrix = cv2.getRotationMatrix2D((cols/2,rows/2),angle,1)
        dst = cv2.warpAffine(image,matrix,(cols,rows))
        cv2.imwrite("{}/{}-rotated-{}.png".format(path,string.split('.')[-2].split('/')[-1],angle),dst)


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

    print("Rotating done")
    pass