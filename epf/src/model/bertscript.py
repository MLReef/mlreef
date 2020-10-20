#MLReef 2020 BERT sentiment classification
import os
import argparse

from torch.utils.data import RandomSampler
from transformers import BertConfig, BertForSequenceClassification, BertTokenizer

from bertdataset import SentimentDataset
from bertmodel import SentimentBERT

BERT_MODEL = 'bert-base-uncased'
NUM_LABELS = 2  # negative and positive reviews

parser = argparse.ArgumentParser(prog='bertscript')
parser.add_argument('--input-path', default='data',type=str, action='store', help='path to data folder')
parser.add_argument('--output-path', default='.', type=str, action='store', help='output path to save images')
parser.add_argument('--train', action="store_true", help="Train new weights")
parser.add_argument('--epochs', action="store", type=int, default=10, help="Epochs for training")
parser.add_argument('--evaluate', action="store_true", help="Evaluate existing weights")
parser.add_argument('--predict', default="", type=str, help="Predict sentiment on a given sentence")
parser.add_argument('--path', default='weights/', type=str, help="Weights path")
parser.add_argument('--train-file', default='imdb_train.txt',
                    type=str, help="IMDB train file. One sentence per line.")
parser.add_argument('--test-file', default='imdb_test.txt',
                    type=str, help="IMDB train file. One sentence per line.")
args = parser.parse_args()


def train(train_file, epochs, output_dir):
    config = BertConfig.from_pretrained(BERT_MODEL, num_labels=NUM_LABELS)
    tokenizer = BertTokenizer.from_pretrained(BERT_MODEL, do_lower_case=True)
    model = BertForSequenceClassification.from_pretrained(BERT_MODEL, config=config)

    dt = SentimentDataset(tokenizer)
    dataloader = dt.prepare_dataloader(train_file, sampler=RandomSampler)
    predictor = SentimentBERT()
    predictor.train(tokenizer, dataloader, model, epochs)

    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)


def evaluate(test_file, model_dir="weights/"):
    predictor = SentimentBERT()
    predictor.load(model_dir=model_dir)

    dt = SentimentDataset(predictor.tokenizer)
    dataloader = dt.prepare_dataloader(test_file)
    score = predictor.evaluate(dataloader)
    print(score)


def predict(text, model_dir="weights/"):
    predictor = SentimentBERT()
    predictor.load(model_dir=model_dir)

    dt = SentimentDataset(predictor.tokenizer)
    dataloader = dt.prepare_dataloader_from_examples([(text, -1)], sampler=None)   # text and a dummy label
    result = predictor.predict(dataloader)

    return "Positive" if result[0] == 0 else "Negative"


if __name__ == '__main__':
    if args.train:
        os.makedirs(os.path.join(args.output_path,args.path), exist_ok=True)
        train(os.path.join(args.input_path,args.train_file), epochs=args.epochs, output_dir=os.path.join(args.output_path,args.path))

    if args.evaluate:
        evaluate(os.path.join(args.input_path,args.test_file), model_dir=os.path.join(args.output_path,args.path))

    if len(args.predict) > 0:
        print(predict(args.predict, model_dir=os.path.join(args.output_path,args.path)))

    #print(predict("It was truly amazing experience.", model_dir=args.path))
