const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError.js");
const jsonschema = require("jsonschema");
const Job = require("../models/job.js");
const jobsSchema = require("../schemas/jobsSchema.json");
const jobsUpdateSchema = require("../schemas/jobsUpdateSchema.json");
const auth = require("../helpers/authMiddleware.js");

//create new job post route

router.post("/", auth.authenticateJWT, auth.ensureIsAdmin, async function (
  req,
  res,
  next
) {
  try {
    const validationResult = jsonschema.validate(req.body, jobsSchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = validationResult.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let { title, salary, equity, company_handle, date_posted } = req.body;
    let result = await Job.create(
      title,
      salary,
      equity,
      company_handle,
      date_posted
    );
    return res.json({ job: result });
  } catch (err) {
    return next(err);
  }
});

router.get("/", auth.authenticateJWT, auth.ensureLoggedIn, async function (
  req,
  res,
  next
) {
  try {
    let { search, min_salary, min_equity } = req.query;
    let result = await Job.getAll(search, min_salary, min_equity);
    return res.json({ jobs: result });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", auth.authenticateJWT, auth.ensureLoggedIn, async function (
  req,
  res,
  next
) {
  try {
    let id = req.params.id;
    let result = await Job.get(id);
    return res.json({ job: result });
  } catch (err) {
    return next(err);
  }
});

//partially update a job specified by the id

router.patch("/:id", auth.authenticateJWT, auth.ensureIsAdmin, async function (
  req,
  res,
  next
) {
  try {
    const validationResult = jsonschema.validate(req.body, jobsUpdateSchema);

    if (!validationResult.valid) {
      // pass validation errors to error handler
      //  (the "stack" key is generally the most useful)
      let listOfErrors = validationResult.errors.map((error) => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let id = req.params.id;
    delete req.body._token;
    let result = await Job.update(id, req.body);
    return res.json({ job: result });
  } catch (err) {
    return next(err);
  }
});

//delete a company by handle

router.delete("/:id", auth.authenticateJWT, auth.ensureIsAdmin, async function (
  req,
  res,
  next
) {
  try {
    let id = req.params.id;
    await Job.delete(id);
    return res.json({ message: "Job deleted!" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
