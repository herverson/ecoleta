import Knex from 'knex';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex: Knex) {
  await knex('items').insert([
    { id: uuidv4(), title: 'Lâmpadas', image: 'lampada.svg' },
    { id: uuidv4(), title: 'Pilhas e Baterias', image: 'baterias.svg' },
    { id: uuidv4(), title: 'Papéis e Papelão', image: 'papeis-papelao.svg' },
    { id: uuidv4(), title: 'Resíduos Eletrônicos', image: 'eletronicos.svg' },
    { id: uuidv4(), title: 'Resíduos Orgânicos', image: 'organicos.svg' },
    { id: uuidv4(), title: 'Óleo de Cozinha', image: 'oleo.svg' },
  ]);
}