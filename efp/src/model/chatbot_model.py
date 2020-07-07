import tensorflow as tf
import tflearn
import argparse
import pickle
import sys


class Model:
    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.lr = float(params['learning_rate'])
        self.batch_size = int(params['batch_size'])
        self.epochs = int(params['epochs'])
        with open('../data/training_data.pkl', 'rb') as f:
            training = pickle.load(f)

        # create train and test lists
        self.train_x = list(training['train_x'])
        self.train_y = list(training['train_y'])
        # reset underlying graph data


        # Build neural network
    def train(self):
        tf.reset_default_graph()
        net = tflearn.input_data(shape=[None, len(self.train_x[0])])
        net = tflearn.fully_connected(net, 8,weight_decay=0.01,regularizer='L2')
        net = tflearn.fully_connected(net, len(self.train_y[0]), activation='softmax')
        #loss = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits=net, labels=train_y[0]))
        net = tflearn.regression(net,learning_rate=0.01)
        # Define model and setup tensorboard
        model = tflearn.DNN(net, tensorboard_dir='tflearn_logs')
        # Start training (apply gradient descent algorithm)
        model.fit(self.train_x, self.train_y, n_epoch=self.epochs, batch_size=self.batch_size, show_metric=True)
        model.save(self.output_dir + 'model.tflearn')


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Text ops')
    parser.add_argument('--input-path', type=str, action='store', help='path to directory of images')
    parser.add_argument('--output-path', default='.', type=str, action='store', help='output path to save images')
    parser.add_argument('--learning-rate', default=0.01, type=float, action='store', help='learning rate')
    parser.add_argument('--batch-size', default=8, type=int, action='store', help='batch size')
    parser.add_argument('--epochs', default=400, type=int, action='store', help='epochs')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of txt_ops.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = Model(params)
    print(type(params))
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("learning rate:", op.lr)
    print("batch size:", op.batch_size)
    print("epochs:", op.epochs)
    op.train()


