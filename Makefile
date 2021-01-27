.PHONY: ui

ui:
	npm install --prefix tornjak-frontend
	npm run build --prefix tornjak-frontend
	rm -rf ui
	cp -r tornjak-frontend/build ui
