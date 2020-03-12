package:
	@echo 🧹 Creating clean workspace…
	rm -rf pkg
	mkdir pkg

	@echo 📦 Building package…
	npm run build
	cp -r dist pkg/.
	cp -r loader pkg/.
	cp LICENSE pkg/.
	cp README.md pkg/.
	cp package.json pkg/.
	npm run clean-package-json
