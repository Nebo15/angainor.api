export default {
  readModelsList: (model, conditions, callback) => {
    model.find(conditions, callback);
  },
  readModel: (model, id, callback) => {
    model.findById(id, callback);
  },

  createModel: (model, data, callback) => {
    model.create(data, callback);
  },

  updateModel: (model, id, data, callback) => {
    model.findByIdAndUpdate(id, data, {new: true}, callback);
  },

  deleteModel: (model, id, callback) => {
    model.remove({_id: id}, callback);
  }

}