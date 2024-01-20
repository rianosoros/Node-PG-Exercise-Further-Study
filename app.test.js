const request = require('supertest');
const app = require('./app');

describe('GET /invoices', () => {
  it('should get a list of invoices', async () => {
    const response = await request(app).get('/invoices');
    expect(response.status).toBe(200);
    expect(response.body.invoices).toBeDefined();
  });
});

describe('GET /invoices/:id', () => {
  it('should get a specific invoice by ID', async () => {
    const response = await request(app).get('/invoices/1');
    expect(response.status).toBe(200);
    expect(response.body.invoice).toBeDefined();
  });

  it('should return 404 for non-existent invoice ID', async () => {
    const response = await request(app).get('/invoices/999');
    expect(response.status).toBe(404);
  });
});

describe('POST /invoices', () => {
  it('should create a new invoice', async () => {
    const newInvoice = {
      comp_code: 'ABC',
      amt: 100.0,
    };

    const response = await request(app).post('/invoices').send(newInvoice);
    expect(response.status).toBe(201);
    expect(response.body.invoice).toBeDefined();
  });
});

describe('PUT /invoices/:id', () => {
  it('should update an existing invoice by ID', async () => {
    const updatedInvoice = {
      amt: 150.0,
    };

    const response = await request(app).put('/invoices/1').send(updatedInvoice);
    expect(response.status).toBe(200);
    expect(response.body.invoice).toBeDefined();
  });

  it('should return 404 for non-existent invoice ID', async () => {
    const response = await request(app).put('/invoices/999').send({ amt: 150.0 });
    expect(response.status).toBe(404);
  });
});

describe('DELETE /invoices/:id', () => {
  it('should delete an existing invoice by ID', async () => {
    const response = await request(app).delete('/invoices/1');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('deleted');
  });

  it('should return 404 for non-existent invoice ID', async () => {
    const response = await request(app).delete('/invoices/999');
    expect(response.status).toBe(404);
  });
});
