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
    with open("logging.txt","a+") as logging_file: 
        #logging_file.write("Old File:{} , New File:{}, Transformation:{} Parameters:{} \n".format(string,(string.split('.')[0]+"-"+str(angle)+".png"),pipeline,angle))
        logging_file.write("{} ,{} ,{} ,{} \n".format(string,(string.split('.')[0]+"-"+str(angle)+".png"),pipeline,angle))
    print("Done File!")

if os.path.isdir(string):   
    for file in os.listdir(string):
        path = '/'.join(string.split('/')[0:-1])
        image = cv2.imread(string+file)
        rows,cols = image.shape[0:-1]
        matrix = cv2.getRotationMatrix2D((cols/2,rows/2),angle,1)
        dst = cv2.warpAffine(image,matrix,(cols,rows))
        cv2.imwrite("{}/{}-{}.png".format(path,file.split('.')[-2].split('/')[-1],angle),dst)
        with open("logging.txt","a+") as logging_file: 
            #logging_file.write("Old File:{} , New File:{}, Transformation:{} Parameters:{} \n".format(string+file,(string+file.split('.')[0]+"-"+str(angle)+".png"),pipeline,angle))
            logging_file.write("{} ,{} ,{} ,{} \n".format(string+file,(string+file.split('.')[0]+"-"+str(angle)+".png"),pipeline,angle))
    print("Done Directory!")
