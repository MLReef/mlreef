import unittest
import sys
import os
import shutil

sys.path.append(os.path.abspath('..'))
from pipelines.im_create_thumbnails import Thumbnail
from pipelines.im_lee_filter import LeeFilter
from pipelines.im_random_crop import RandomCrop
from pipelines.im_rotate import Rotate
from pipelines.im_distort_affine import DistortAffine
from pipelines.im_random_erasing import RandomErasing
from pipelines.im_color_modifier import ColorModifier
from pipelines.im_add_noise import AddNoise



class Test(unittest.TestCase):

    def setUp(self):
        params = {}
        params['input_path'] = 'data'
        params['output_path'] = 'test_data'
        params['size'] = 64
        params['intensity'] = 5
        params['seed'] = 5
        params['height'] = 64
        params['width'] = 64
        params['angle'] = 30
        params['rotation']= 60
        params['shear']= 5
        params['prob'] = 1.0
        params['ratio'] = 1.0
        params['scale_min'] = 0.1
        params['scale_max'] = 0.2
        params['brightness'] = 1.0
        params['contrast'] = 1.0
        params['saturation']= 2.0
        params['mode']='gaussian'

        self.tb = Thumbnail(params)
        self.lf = LeeFilter(params)
        self.rc = RandomCrop(params)
        self.rt = Rotate(params)
        self.da = DistortAffine(params)
        self.re = RandomErasing(params)
        self.cm = ColorModifier(params)
        self.an = AddNoise(params)



    def testParser(self):
        self.assertEqual(self.tb.input_dir, 'data')
        self.assertEqual(self.tb.output_dir, 'test_data')
        self.assertEqual(self.tb.size[0], 64)

        self.assertEqual(self.lf.input_dir, 'data')
        self.assertEqual(self.lf.output_dir, 'test_data')
        self.assertEqual(self.lf.intensity, 5)

        self.assertEqual(self.rc.input_dir, 'data')
        self.assertEqual(self.rc.output_dir, 'test_data')
        self.assertEqual(self.rc.height, 64)
        self.assertEqual(self.rc.width, 64)
        self.assertEqual(self.rc.seed, 5)

        self.assertEqual(self.rt.input_dir, 'data')
        self.assertEqual(self.rt.output_dir, 'test_data')
        self.assertEqual(self.rt.angle, 30)

        self.assertEqual(self.da.input_dir, 'data')
        self.assertEqual(self.da.output_dir, 'test_data')
        self.assertEqual(self.da.rotation, 60)
        self.assertEqual(self.da.shear, 5)

        self.assertEqual(self.re.input_dir, 'data')
        self.assertEqual(self.re.output_dir, 'test_data')
        self.assertEqual(self.re.ratio, 1.0)
        self.assertEqual(self.re.probability, 1.0)
        self.assertEqual(self.re.sl,0.1)
        self.assertEqual(self.re.sh,0.2)

        self.assertEqual(self.cm.input_dir, 'data')
        self.assertEqual(self.cm.output_dir, 'test_data')
        self.assertEqual(self.cm.brightness, 1.0)
        self.assertEqual(self.cm.contrast, 1.0)
        self.assertEqual(self.cm.saturation, 2.0)

        self.assertEqual(self.an.input_dir, 'data')
        self.assertEqual(self.an.output_dir, 'test_data')
        self.assertEqual(self.an.mode, 'gaussian')

    def testMethods(self):
        exec_thumbnail = self.tb.__execute__()
        exec_lee_filter = self.lf.__execute__()
        exec_random_crop = self.rc.__execute__()
        exec_rotate = self.rt.__execute__()
        exec_affine_distortion = self.da.__execute__()
        exec_random_erasing = self.re.__execute__()
        exec_color_mod = self.cm.__execute__()
        exec_add_noise = self.an.__execute__()


        self.assertEqual(exec_thumbnail,1)
        self.assertEqual(exec_lee_filter,1)
        self.assertEqual(exec_random_crop,1)
        self.assertEqual(exec_rotate,1)
        self.assertEqual(exec_affine_distortion,1)
        self.assertEqual(exec_random_erasing,1)
        self.assertEqual(exec_color_mod,1)
        self.assertEqual(exec_add_noise,1)

        self.assertEqual(os.path.isfile(os.path.join(self.tb.output_dir,'lena_resized.jpg')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.lf.output_dir,'lena_fltrd.jpg')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.rc.output_dir,'lena_cropped.jpg')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.rt.output_dir,'lena_rotated.jpg')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.da.output_dir,'lena_dstr.jpg')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.re.output_dir,'lena_re.jpg')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.cm.output_dir,'lena_cm.jpg')), True)
        self.assertEqual(os.path.isfile(os.path.join(self.an.output_dir,'lena_noise.jpg')), True)



    def tearDown(self):
        if os.path.exists(self.tb.output_dir):
            shutil.rmtree(self.tb.output_dir)
        print("Test cleanup done")



if __name__ == '__main__':
    unittest.main()