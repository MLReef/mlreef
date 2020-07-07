import unittest
import sys
import os
import shutil

sys.path.append(os.path.abspath('..'))
from pipelines.txt_ops import TextPreparation


class Test(unittest.TestCase):

    def setUp(self):
        params = {}
        params['input_path'] = 'data/intents_test.json'
        params['output_path'] = 'test_data'
        params['stemmed'] = True
        params['filternums'] = True
        params['num2words'] = True
        params['stopwords'] = True
        self.tp = TextPreparation(params)

    def testParser(self):
        self.assertEqual(self.tp.input_dir, 'data/intents_test.json')
        self.assertEqual(self.tp.output_dir, 'test_data')
        self.assertEqual(self.tp.stemmed, True)
        self.assertEqual(self.tp.filternums, True)
        self.assertEqual(self.tp.num2words, True)
        self.assertEqual(self.tp.use_stopwords, True)

    def testMethods(self):
        exec_text_prep = self.tp.__execute__()
        self.assertEqual(os.path.isfile(os.path.join(self.tp.output_dir, 'training_data.pkl')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.tp.output_dir, 'wordlist.txt')), True)

    def tearDown(self):
        if os.path.exists(self.tp.output_dir):
            shutil.rmtree(self.tp.output_dir)
        print("Test cleanup done")

if __name__ == '__main__':
    unittest.main()