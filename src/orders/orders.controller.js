const path = require("path");
const ordersService = require("./orders.service");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// ================================================================================================================== //
// =================================================== Middleware =================================================== //
// ================================================================================================================== //

const orderExists = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.foundOrder = foundOrder;
    return next();
  } else {
    next({
      status: 404,
      message: `Order not found for id: ${orderId}`,
    });
  }
};

const areOrderIdsEqual = (req, res, next) => {
  const { orderId } = req.params;
  const { id } = req.body.data;
  if (id) {
    if (orderId !== id) {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
      });
    }
  }
  next();
};

const validateStatusProperty = (req, res, next) => {
  const { status } = req.body.data;
  if (!status || !status.length) {
    return next({
      status: 400,
      message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }

  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  if (status === "invalid") {
    return next({
      status: 400,
      message: "An order with invalid status cannot be changed",
    });
  }

  next();
};

const validateOrderParameters = (req, res, next) => {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;

  if (!deliverTo || !deliverTo.length) {
    return next({ status: 400, message: "Order must include a deliverTo" });
  }

  if (!mobileNumber || !mobileNumber.length) {
    return next({ status: 400, message: "Order must include a mobileNumber" });
  }

  if (dishes === undefined) {
    return next({ status: 400, message: "Order must include a dish" });
  }

  if (!(Array.isArray(dishes) && dishes.length)) {
    return next({ status: 400, message: "Order must include at least one dish" });
  }

  dishes.forEach((dish, index) => {
    if (!("quantity" in dish) || !Number.isInteger(dish.quantity) || dish.quantity <= 0) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  res.locals.newOrder = newOrder;
  next();
};

const isStatusPending = (req, res, next) => {
  const foundOrder = res.locals.foundOrder;
  if (foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }

  next();
};

// ================================================================================================================== //
// ================================================= Route Handlers ================================================= //
// ================================================================================================================== //

const list = async (req, res, next) => {
  const data = await ordersService.list();

  res.json({ data });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.foundOrder });
};

const create = (req, res, next) => {
  orders.push(res.locals.newOrder);

  res.status(201).json({ data: res.locals.newOrder });
};

const update = (req, res, next) => {
  const foundOrder = res.locals.foundOrder;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  res.json({ data: foundOrder });
};

const destroy = (req, res, next) => {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);

  orders.splice(index, 1);

  res.sendStatus(204);
};

// ================================================================================================================== //

module.exports = {
  list,
  read: [orderExists, read],
  create: [validateOrderParameters, create],
  update: [orderExists, areOrderIdsEqual, validateStatusProperty, validateOrderParameters, update],
  destroy: [orderExists, isStatusPending, destroy],
};
