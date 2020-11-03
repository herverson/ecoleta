import { Request, Response} from 'express';
import knex from '../database/connection';
import { v4 as uuidv4 } from 'uuid';


class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items} = request.query;

    const parsedItems = String(items)
        .split(',')
        .map(item => String(item.trim()));

    const points = await knex('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*');
    
    return response.json(points);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found!' });
    }

    const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');
    
    return response.json({ point, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
    try {
      const point = {
        id: uuidv4(),
        image: 'https://images.unsplash.com/photo-1501523460185-2aa5d2a0f981?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
        name,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
      };

      const trx = await knex.transaction();
      const insertedIds = await trx('points').insert(point).returning('id');
  
      const point_id = insertedIds[0];
  
      const pointItems = items.map((item_id: string) => {
        const id = uuidv4();
        return {
          id,
          item_id,
          point_id,
        };
      });
  
      await trx('point_items').insert(pointItems);

      await trx.commit();
  
      return response.json({
        ...point,
      });
    } catch (_) {
      return response.json({ success: false })
    }
  }
}

export default PointsController;