from scipy.ndimage.filters import uniform_filter
from scipy.ndimage.measurements import variance
import cv2
import os
import sys
import argparse


def processArguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Lee Filter')
    parser.add_argument('--images-path', action='store', help='path to directory of images or image file')
    parser.add_argument('--intensity', action='store', help='intensity of the Lee Filter')
    params = vars(parser.parse_args(args))
    return params

def lee_filter(img, intensity):
    img_mean = uniform_filter(img, (intensity, intensity))
    img_sqr_mean = uniform_filter(img**2, (intensity, intensity))
    img_variance = img_sqr_mean - img_mean**2
    overall_variance = variance(img)
    img_weights = img_variance / (img_variance + overall_variance)
    img_output = img_mean + img_weights * (img - img_mean)
    return img_output


if __name__ == "__main__":
    params = process_arguments(sys.argv[1:])
    string = params['images_path']
    intensity = int(params['intensity'])


    if os.path.isfile(string):
        path = '/'.join(string.split('/')[0:-1])
        image = cv2.imread(string,0)
        height,width = image.shape
        image_despeckeled = lee_filter(image,intensity)
        cv2.imwrite("{}/{}-despeckled.png".format(path,string.split('.')[-2].split('/')[-1]),image_despeckeled)
        print("Done")

    if os.path.isdir(string):   
        for subdir, dirs, files in os.walk(string):
            for file in files:
                try:
                    path = '/'.join(string.split('/')[0:-1])
                    image = cv2.imread(os.path.join(subdir,file),0)
                    rows,cols = image.shape
                    height,width = image.shape
                    image_despeckeled = lee_filter(image,intensity)
                    cv2.imwrite("{}/{}-filtered.png".format(subdir,file.split('.')[0]),image_despeckeled)
                    print("Done")
                
                except Exception as identifier:
                    print("Error:", identifier)
                    pass
pass
