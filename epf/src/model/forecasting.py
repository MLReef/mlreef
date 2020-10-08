# This is the model published in :https://www.kaggle.com/tandonarpit6/store-item-demand-forecasting-challenge-fbprophet
# Minor changes for sharing this model with MLReef
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import os
import sys
from fbprophet import Prophet
import argparse


class Forecasting:
    def __init__(self, params):
        self.input_dir = params['input_path']
        self.input_file= params['input_file']
        self.test_file = params['test_file']
        self.output_dir = params['output_path']
        self.seasonality = params['seasonality']
        self.period = float(params['period'])
        self.fourier_order = int(params['fourier_order'])
        self.future_periods = int(params['future_periods'])
        # Please add here the extensions that you need
        self.ext = ['.csv']

        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def __execute__(self):
        training_data = pd.read_csv(os.path.join(self.input_dir,self.input_file))
        test_data = pd.read_csv(os.path.join(self.input_dir, self.test_file))
        training_data['date']= pd.to_datetime(training_data['date'])
        test_data['date']= pd.to_datetime(test_data['date'])
        submission=pd.DataFrame()
        forecast_values=pd.Series([])
        index=0
        for item in training_data['item'].unique():
            for store in training_data['store'].unique():
                temp_training = training_data.loc[(training_data['store']==store) & (training_data['item']== item)]
                temp_training=temp_training[['date','sales']]
                temp_training.rename(columns={'date':'ds','sales':'y'}, inplace=True)
                model = Prophet()
                model.add_seasonality(name=self.seasonality, period=self.period, fourier_order=self.fourier_order )
                model.fit(temp_training)
                future = model.make_future_dataframe(periods=self.future_periods)
                forecast = model.predict(future)
                forecast = forecast.tail(self.future_periods)
                forecast_values = forecast_values.append(forecast['yhat'],ignore_index=True)
                index = index+1
                print("Iteration",index)

        submission['id'] = test_data['id']
        submission['sales'] = forecast_values
        submission.to_csv(os.path.join(self.output_dir,'prediction.csv'),index=False)


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Random erasing')
    parser.add_argument('--input-path', action='store', type=str, default='data', help='Path to input folder')
    parser.add_argument('--input-file', action='store', type=str, default='data', help='Name of input csv file')
    parser.add_argument('--test-file', action='store',  type=str, default= 'test',help='Name test csv file')
    parser.add_argument('--output-path', action='store', type=str, default ='./output',help='output directory to save the predictions')
    parser.add_argument('--seasonality', action='store', type=str, default='monthly',
                            help=' choose between monthly, quarterly or hourly')
    parser.add_argument('--period', action='store', type=float, default=30.5,help='Float number of days in one period')
    parser.add_argument('--fourier-order', action='store', type=int, default=5, help='Int number of Fourier components to use')
    parser.add_argument('--future-periods', action='store', type=int, default=10, help='Number of periods to predict')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":
    print("Beginning execution of forecasting.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = Forecasting(params)
    print(type(params))
    print("input path:", op.input_dir)
    print("input file:", op.input_file)
    print("test file:", op.test_file)
    print("output path:", op.output_dir)
    print("seasonality:", op.seasonality)
    print("period:", op.period)
    print("fourier order:", op.fourier_order)
    print("future periods:", op.future_periods)
    op.__execute__()
