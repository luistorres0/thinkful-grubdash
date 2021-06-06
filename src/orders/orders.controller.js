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

const orderExists = async (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = await ordersService.read(Number(orderId));
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
  const { order_id } = req.body.data;
  if (order_id) {
    if (order_id !== Number(orderId)) {
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${order_id}, Route: ${orderId}`,
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

const create = async (req, res, next) => {
  const data = await ordersService.create(req.body.data);

  res.status(201).json({ data });
};

const update = async (req, res, next) => {
  const foundOrder = res.locals.foundOrder;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;

  const data = await ordersService.update(foundOrder);

  res.json({ data });
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
