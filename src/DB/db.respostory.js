export async function findOne({
  model,
  filters = {},
  select = "",
  populate = false,
  populateField = "",
}) {
  let result;

  if (populate) {
    result = await model
      .findOne(filters)
      .select(select)
      .populate(populateField);
  } else {
    result = await model.findOne(filters).select(select);
  }

  return result;
}

export async function findById({
  model,
  id,
  select = "",
  populate = false,
  populateField = "",
}) {
  let result;

  if (populate) {
    result = await model.findById(id).select(select).populate(populateField);
  } else {
    result = await model.findById(id).select(select);
  }

  return result;
}

export async function create({ model, insertedData, options = {} }) {
  const [result] = await model.create([insertedData], options);
  return result;
}

export async function updateOne({ model, filter, data, options }) {
  const result = await model.updateOne(filter, data, options);
  return result;
}

export async function findByIdAndUpdate({
  model,
  id,
  data,
  options = {},
  select = "",
  populate = false,
  populateField = "",
}) {
  let result;

  if (populate) {
    result = await model
      .findByIdAndUpdate(id, data, options)
      .select(select)
      .populate(populateField);
  } else {
    result = await model.findByIdAndUpdate(id, data, options).select(select);
  }

  return result;
}
