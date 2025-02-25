import { Rule, SchematicContext, Tree, apply, url, applyTemplates, move, mergeWith } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { Schema } from './schema';

export function dgtidComponent(options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    // Verifica si se ha proporcionado un nombre
    if (!options.name) {
      throw new Error('You must provide a name for the component.');
    }

    // Derivar el nombre del componente en notación dasherizada
    const dasherizedComponentName = strings.dasherize(options.name);
    // Usar el path proporcionado o 'src/app' por defecto
    const componentDirectory = `${options.path || 'src/app'}/${dasherizedComponentName}`;

    const sourceTemplates = apply(url('./files'), [
      applyTemplates({
        ...options,
        ...strings,
      }),
      move(componentDirectory) // Mover a la carpeta con el nombre del componente
    ]);

    return mergeWith(sourceTemplates)(tree, _context);
  };
}
