import tensorflow as tf
import cv2
import os
import sys

pipeline = sys.argv[0]
string = sys.argv[1]
height = int(sys.argv[2])
width = int(sys.argv[3])
if len(sys.argv) >= 5:
    channels = int(sys.argv[4])
else:
    channels=3

if len(sys.argv) == 6:
    seed = int(sys.argv[5])
else:
    seed=None

path = '/'.join(string.split('/')[0:-1])

if os.path.isfile(string):
    
    image = cv2.imread(string)
    image_cropped = tf.image.random_crop(image,[height,width,channels],seed)
    png = tf.image.encode_png(image_cropped,compression=-1,name=None)
    with tf.compat.v1.Session() as sess:
        sess.run(tf.compat.v1.global_variables_initializer())
        png_data_ = sess.run(png)
        open("{}/{}-{}.png".format(path,string.split('.')[-2].split('/')[-1],[height,width]), 'wb+').write(png_data_)   

    with open("logging.txt","a+") as logging_file: 
        #logging_file.write("Old File:{} , New File:{}, Transformation:{} Parameters:{} \n".format(string,(string.split('.')[0]+"-"+str(angle)+".png"),pipeline,angle))
        logging_file.write("{} ,{} ,{} ,{} \n".format(string,(string.split('.')[0]+"-"+str([height,width])+".png"),pipeline,[height,width]))
    print("Done File!")


if os.path.isdir(string):   
    for subdir, dirs, files in os.walk(string):
        for file in files:
            try:
                image = cv2.imread(os.path.join(subdir,file))
                image_cropped = tf.image.random_crop(image,[height,width,channels])
                png = tf.image.encode_png(image_cropped,compression=-1,name=None)
                with tf.compat.v1.Session() as sess:
                    sess.run(tf.compat.v1.global_variables_initializer())
                    png_data_ = sess.run(png)
                    open("{}/{}-{}.png".format(subdir,file.split('.')[0],[height,width]), 'wb+').write(png_data_)   
            except Exception as identifier:
                print("Error:", identifier)
                pass
print("Done Directory!")
