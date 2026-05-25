install:
	python -m pip install --upgrade pip setuptools wheel
	pip install -r requirements.txt

train:
	python train_all.py --epochs 30 --profit-epochs 40

dev:
	uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
