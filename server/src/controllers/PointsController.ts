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

    points.map(point => {
      point['latitude'] = Number(point['latitude']);
      point['longitude'] = Number(point['longitude']);
    });

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.0.106:3030/uploads/${point.image}`,
      };
    });

    return response.json(serializedPoints);
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

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.0.106:3030/uploads/${point.image}`,
    }
    
    return response.json({ point: serializedPoint, items });
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
        image: request.file.filename,
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
  
      const pointItems = items
        .split(',')
        .map((item: string) => (item.trim()))
        .map((item_id: string) => {
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
    } catch (error) {
      console.log(error);
      return response.json({ success: false })
    }
  }
}

export default PointsController;