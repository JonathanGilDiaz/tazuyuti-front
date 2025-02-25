# Getting Started With Schematics

This repository is a basic Schematic implementation that serves as a starting point to create and publish Schematics to NPM.

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with

```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

cd dgtid-schematics
npm install
npm run build
cd ..

//El comando puede ser ejecutado en cualquier parte de la app, en caso de no pasar el path, el componente se creará en src/app/mi-nuevo-componente

ng g dgtid-schematics:dgtid-component --name=mi-nuevo-componente --path=src/app/dashboard/feature

That's it!
