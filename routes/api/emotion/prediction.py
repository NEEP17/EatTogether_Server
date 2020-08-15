import keras
import numpy as np
from keras.preprocessing import image
from keras.preprocessing.image import ImageDataGenerator
from keras.models import model_from_json
import sys

#model = keras.models.load_model('/home/ec2-user/app/what/EatTogether_Server/emotion/model.h5')


#def loadImage(filepath):
#    test_img = image.load_img(filepath, target_size=(224, 224))
#    test_img = image.img_to_array(test_img)
#    test_img = np.expand_dims(test_img, axis = 0)
#    test_img /= 255
#    return test_img

#picture = sys.argv[1]
#prediction = model.predict(loadImage(picture))




#emotion = "Happy!" if np.argmax(prediction) == 1 else "Neutral"

print("happy")
