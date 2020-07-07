import sys
import os
sys.path.insert(1, os.path.join(sys.path[0], '..'))

from annotations.dataprocessor_annotations import data_processor
from annotations.parameter_annotations import parameter
import annotations.parameter_annotations as params
import time
import json

@data_processor(
    # name="Dummy Testoperation",
    # author="MLReef",
    # description="Does nothing but needs time with $epochs and $batch_size",
    # visibility="PUBLIC",
    type = "DATA_OPERATION",
    input_type="IMAGE",
    output_type="IMAGE"
)
# Using epochs as number of iterations and batch_size as timer for duration of sleep
@parameter(name="epochs", datatype="int", required=True, default_value=2, description="Number of epochs")
@parameter(name="batch_size", datatype="int", required=True, default_value=10, description="Emulate batch size")
def inject_variables():
    pass


def run(epochs, batch_size):
    print("Emulate dummy-dataprocessor with epochs={} and batch_size={}".format(epochs,batch_size))
    experiment_dict = {}
    for i in range(epochs):
        epoch = i+1

        experiment_dict[f"{epoch}"] = new_dict_entry(epoch,epochs)
        print("Epoch #{} of {}".format(epoch,epochs))

        sleep(batch_size)
        print( experiment_dict)
        log_json_end(experiment_dict)
    return True


def sleep(batch_size):
    print("Sleep for {}".format(batch_size))
    time.sleep(batch_size)
    return True


def new_dict_entry(epoch,epochs):
    acc = 0.99 * (epoch / epochs)
    dict_to_log = {
        "acc": acc,
        "val_acc": acc-0.1,
        "loss": 3.0 - acc,
        "val_loss": 3.0 - acc
    }
    return dict_to_log


def log_json_end(experiment_dict):
    with open('experiment.json', 'w') as file:
        json.dump(experiment_dict, file)


if __name__ == '__main__':
    inject_variables()
    # init_json_file()

    try:
        epochs = params.epochs
    except:
        epochs = 5

    try:
        batch_size = params.batch_size
    except:
        batch_size = 10

    ts = time.time()
    run(epochs, batch_size)
    tf = time.time()

    print(f"The run function ran for {tf-ts} seconds")
