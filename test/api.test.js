import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import { useDatabase } from './helpers.js';

useDatabase();

const base = '/api/products';
const product = () => ({
  name: 'Trail runner',
  description: 'Lightweight trail shoe',
  price: 89.9,
  stock: 12,
  category: new mongoose.Types.ObjectId().toString(),
});

describe('products service', () => {
  it('creates, reads, updates and deletes a product', async () => {
    const created = await request(app).post(base).send(product()).expect(201);
    const id = created.body._id;

    const list = await request(app).get(base).expect(200);
    assert.equal(list.body.length, 1);

    const updated = await request(app).put(`${base}/${id}`).send({ price: 79.9 }).expect(200);
    assert.equal(updated.body.price, 79.9);
    assert.equal(updated.body.name, 'Trail runner');

    await request(app).delete(`${base}/${id}`).expect(200);
    await request(app).get(`${base}/${id}`).expect(404);
  });

  it('allows setting stock to zero', async () => {
    const { body } = await request(app).post(base).send(product()).expect(201);
    const res = await request(app).put(`${base}/${body._id}`).send({ stock: 0 }).expect(200);
    assert.equal(res.body.stock, 0);
  });

  it('rejects a negative price or missing fields', async () => {
    await request(app).post(base).send({ ...product(), price: -1 }).expect(400);
    await request(app).post(base).send({ name: 'Incomplete' }).expect(400);
  });

  it('exposes Prometheus metrics', async () => {
    const res = await request(app).get(`${base}/metrics`).expect(200);
    assert.match(res.text, /http_request_duration/);
  });
});
