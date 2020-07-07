
set IMAGE=registry.gitlab.com/mlreef/epf:feature-with-backend
echo Using %IMAGE%
docker pull %IMAGE%
docker create --name epf --rm %IMAGE% 
docker start epf
docker exec --detach epf epf-finish
docker exec epf /bin/bash -c "python /epf/model/debug_dataprocessor.py --images_path file --epochs 5 --batch_size 5"