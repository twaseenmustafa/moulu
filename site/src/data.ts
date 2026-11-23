export type ProductId = 'dune' | 'pebble' | 'crumb';
export type Fabric = 'ember' | 'chalk' | 'cocoa';

export interface Product {
  name: string;
  price: number;
  /** width, depth, height, seat height — cm */
  dims: [number, number, number, number];
  arm: number; // arm height cm (0 = no arms)
  specs: [string, string][];
}

export const PRODUCTS: Record<ProductId, Product> = {
  dune: {
    name: 'Dune sofa', price: 4290, dims: [228, 104, 68, 40], arm: 58,
    specs: [['Width × depth × height', '228 × 104 × 68 cm'], ['Seat height / depth', '40 / 64 cm'], ['Measured sink', '9 cm at 75 kg'], ['Frame', 'Kiln-dried beech'], ['Suspension', 'Pocket springs'], ['Plinth', 'Oiled walnut'], ['Covers', 'Zip-off, dry-clean'], ['Weight', '78 kg'], ['Lead time', '8–10 weeks']],
  },
  pebble: {
    name: 'Pebble lounge chair', price: 1890, dims: [96, 92, 70, 40], arm: 58,
    specs: [['Width × depth × height', '96 × 92 × 70 cm'], ['Seat height / depth', '40 / 60 cm'], ['Measured sink', '9 cm at 75 kg'], ['Frame', 'Kiln-dried beech'], ['Suspension', 'Pocket springs'], ['Plinth', 'Oiled walnut'], ['Covers', 'Zip-off, dry-clean'], ['Weight', '31 kg'], ['Lead time', '8–10 weeks']],
  },
  crumb: {
    name: 'Crumb ottoman', price: 690, dims: [72, 72, 38, 38], arm: 0,
    specs: [['Width × depth × height', '72 × 72 × 38 cm'], ['Seat height', '38 cm'], ['Measured sink', '6 cm at 75 kg'], ['Frame', 'Kiln-dried beech'], ['Fill', 'Three-density foam + feather wrap'], ['Plinth', 'Oiled walnut'], ['Covers', 'Zip-off, dry-clean'], ['Weight', '12 kg'], ['Lead time', '6–8 weeks']],
  },
};

export const FABRIC_LINES: Record<Fabric, string> = {
  ember: 'Warm, loud, impossible to ignore. Ember is the colour of the last ten minutes of sun.',
  chalk: 'Quiet and bright. Chalk wool makes a dark room feel like morning.',
  cocoa: 'Deep, soft, a little serious. Cocoa velvet catches the light only on its curves.',
};

export const FABRIC_NAMES: Record<Fabric, string> = { ember: 'Ember bouclé', chalk: 'Chalk wool', cocoa: 'Cocoa velvet' };

export const euro = (n: number) => '€' + n.toLocaleString('en-GB');
