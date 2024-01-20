const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db")
const slugify = require("slugify")
const router = new express.Router();

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies ORDER BY name`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params.code;
        const companyResults = await db.query(`SELECT code, name, description, industries FROM companies WHERE code = $1`, [code]);
        const invoiceResults = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);
        if (companyResults.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        const company = companyResults.rows[0];
        const invoices = invoiceResults.rows;
        company.invoices = invoices.map(inv => inv.id);
        return res.json({ company: company });
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const slug = slugify(name, { lower: true });
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.put("/:code", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { code } = req.params.code;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't update company with code of ${code}`, 404);
        }
        return res.json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params.code;
        const results = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't delete company with code of ${code}`, 404);
        }
        return res.json({ status: "deleted" });
    } catch (e) {
        return next(e);
    }
});

router.post("/industries", async (req, res, next) => {
    try {
      const { code, industry } = req.body;
      const results = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
      return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
      return next(e);
    }
  });

  router.get("/industries", async (req, res, next) => {
    try {
      const results = await db.query(`SELECT code, industry, array_agg(comp_code) AS company_codes FROM industries LEFT JOIN company_industry ON industries.code = company_industry.ind_code GROUP BY code, industry`);
      return res.json({ industries: results.rows });
    } catch (e) {
      return next(e);
    }
  });

  router.post("/:comp_code/industries/:ind_code", async (req, res, next) => {
    try {
      const { comp_code, ind_code } = req.params;
      await db.query(`INSERT INTO company_industry (comp_code, ind_code) VALUES ($1, $2)`, [comp_code, ind_code]);
      return res.json({ status: "success" });
    } catch (e) {
      return next(e);
    }
  });

module.exports = router;