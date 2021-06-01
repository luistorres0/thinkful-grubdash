const path = require("path");
const dishesService = require("./dishes.service");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// ================================================================================================================== //
// =================================================== Middleware =================================================== //
// ================================================================================================================== //

const dishExists = async (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = await dishesService.read(dishId);

  if (foundDish) {
    res.locals.foundDish = foundDish;
    return next();
  } else {
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }
};

const areDishIdsEqual = (req, res, next) => {
  const { dishId } = req.params;
  const { id } = req.body.data;
  if (id) {
    if (dishId !== id) {
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
    }
  }
  next();
};

const validateDishParameters = (req, res, next) => {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (!name || !name.length) {
    return next({ status: 400, message: "Dish must include a name" });
  }

  if (!description || !description.length) {
    return next({ status: 400, message: "Dish must include a description" });
  }

  if (!price) {
    if (price !== 0) {
      return next({ status: 400, message: "Dish must include a price" });
    }
  }

  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  if (!image_url || !image_url.length) {
    return next({ status: 400, message: "Dish must include a image_url" });
  }

  const newDish = {
    name,
    description,
    price,
    image_url,
  };

  res.locals.newDish = newDish;

  next();
};

// ================================================================================================================== //
// ================================================= Route Handlers ================================================= //
// ================================================================================================================== //

const list = async (req, res, next) => {
  const data = await dishesService.list();
  res.json({ data });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.foundDish });
};

const create = async (req, res, next) => {
  const data = await dishesService.create(res.locals.newDish);

  res.status(201).json({ data });
};

const update = (req, res, next) => {
  const foundDish = res.locals.foundDish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
};

// ================================================================================================================== //

module.exports = {
  list,
  read: [dishExists, read],
  create: [validateDishParameters, create],
  update: [dishExists, areDishIdsEqual, validateDishParameters, update],
};
