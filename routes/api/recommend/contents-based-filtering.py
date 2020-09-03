import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys

data = pd.read_csv('/home/ec2-user/app/what/EatTogether_Server/routes/api/recommend/foods.csv')
count_vector = CountVectorizer(ngram_range=(1,6))
c_vector_category = count_vector.fit_transform(data['category'])
#코사인 유사도를 구한 벡터를 미리 저장
category_c_sim = cosine_similarity(c_vector_category, c_vector_category).argsort()[:, ::-1]

n = int(sys.argv[2])

def get_recommend_food_list(df, food_name, top=10):
    target_food_index = df[df['name'] == food_name].index.values
    sim_index = category_c_sim[target_food_index, :top].reshape(-1)
    sim_index = sim_index[sim_index != target_food_index]
    result = df.iloc[sim_index][n:n+1].values[0]
    
    return result[1]
    
    
print(get_recommend_food_list(data, food_name=sys.argv[1]))
