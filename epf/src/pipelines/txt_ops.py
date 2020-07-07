# Text preparation for training by MLReef 2020
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
from nltk.tokenize import RegexpTokenizer
import pickle
import random
import json
import string
import nltk
import re
import sys
import os
import argparse
import numpy as np
from num2words import num2words

#if you want to download the data locally
#nltk.download('stopwords')
#nltk.download('punkt')


class TextPreparation:
    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.stemmed = bool(params['stemmed'])
        self.filternums = bool(params['filternums'])
        self.num2words = bool(params['num2words'])
        self.use_stopwords = bool(params['stopwords'])


        with open(self.input_dir) as json_data:
            self.intents = json.load(json_data)
        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

        # add some irrelevant words that you want to ignore for better training
        self.ignore_words = ['a','be','this','to','with','?','would','do','i','you']

        #add corpora path please be aware of the location of the files
        nltk.data.path.append('../data/nltk_data')
        self.stopWords = set(stopwords.words('english'))
        self.stemmer = SnowballStemmer('english')
        self.words=[]
        self.documents=[]
        self.classes=[]

    def tokenize_and_stem(self, text):
        # first tokenize by sentence, then by word
        tokens = [word.lower() for sent in nltk.sent_tokenize(text) for word in nltk.word_tokenize(sent)]
        filtered_tokens = []
        # filter out any tokens not containing words (e.g.raw punctuation)
        for token in tokens:
            token=re.sub('[^A-Za-z0-9]+', '', token)
            if self.filternums:
                token = re.sub('[^A-Za-z]+', '', token)
            if re.search(r'^[0-9]*$', token) and self.num2words and len(token)>0:
                word = num2words(int(token))
                filtered_tokens.append(word)
            elif re.search('[a-zA-Z0-9]', token):
                filtered_tokens.append(token)

        if self.stemmed:
            stems = [self.stemmer.stem(t) for t in filtered_tokens]
            return stems
        else:
            return filtered_tokens

    def getWordList(self):
        # loop through each sentence in our intents patterns
        for intent in self.intents['intents']:
            for pattern in intent['patterns']:
                # tokenize each word in the sentence
                tokenizer = RegexpTokenizer(r'\w+')
                w = self.tokenize_and_stem(pattern.translate(string.punctuation))
                # add to our words list
                self.words.extend(w)
                # add to documents in our corpus
                self.documents.append((w, intent['tag']))
                # add to our classes list
                if intent['tag'] not in self.classes:
                    self.classes.append(intent['tag'])

        words = [w for w in self.words if w not in self.ignore_words]
        if self.use_stopwords:
            words = [w for w in words if w not in self.stopWords]

        return sorted(list(set(words)))


    # create our training data
    def __execute__(self):
        words = self.getWordList()
        with open(self.output_dir + '/wordlist.txt', 'w') as fp:
            fp.write("\n".join(words))
        training = []
        xx = []
        # create an empty array for our output
        output_empty = [0] * len(self.classes)
        # training set, bag of words for each sentence
        for doc in self.documents:
            # initialize our bag of words
            bag = []
            # list of tokenized words for the pattern
            pattern_words = doc[0]
            # create our bag of words array
            for w in words:
                bag.append(1) if w in pattern_words else bag.append(0)

            # output is a '0' for each tag and '1' for current tag
            output_row = list(output_empty)
            output_row[self.classes.index(doc[1])] = 1
            xx.append(self.classes.index(doc[1]))
            # for unknown words add last 0
            bag.append(0)
            training.append([bag, output_row])

        # shuffle our features and turn into np.array
        random.shuffle(training)
        training = np.array(training)

        # create train and test lists
        train_x = list(training[:, 0])
        train_y = list(training[:, 1])

        # save all of our data structures
        pickle.dump({'words': self.words, 'classes': self.classes, 'train_x': train_x, 'train_y': train_y},
                    open(self.output_dir+"/training_data.pkl", "wb"))


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Text ops')
    parser.add_argument('--input-path', type=str, action='store', help='path to directory of images')
    parser.add_argument('--output-path', type=str, action='store', help='output path to save images')
    parser.add_argument('--stemmed', default=False, type=bool, action='store', help='stemmed words')
    parser.add_argument('--filternums', default=False, type=bool, action='store', help='filter numbers')
    parser.add_argument('--num2words', default=False, type=bool, action='store', help='number to words')
    parser.add_argument('--stopwords', default=True, type=bool, action='store', help='use english stopwords')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of txt_ops.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = TextPreparation(params)
    print(type(params))
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("stemmed", op.stemmed)
    print("filternums", op.filternums)
    print("num2words", op.num2words)
    print("stopwords", op.use_stopwords)

    op.__execute__()


