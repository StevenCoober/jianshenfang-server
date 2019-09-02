const Base = require('./base.js');

module.exports = class extends Base {
  //  test(test) = {
  //    id:int, /**/ 
  //    name:varchar, /*标签名称*/ 
  //    display_name:varchar, /*标签详细名称*/ 
  //    sort_order:int, /**/ 
  //    version:int, /**/ 
  //    created_at:timestamp, /**/ 
  //    updated_at:timestamp, /**/ 
  //  }
  /**
   * index action
   * @return {Promise} []
   */
  async indexAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';

    const model = this.model('test');
    const data = await model.where({name: ['like', `%${name}%`]}).order(['id ASC']).page(page, size).countSelect();

    return this.success(data);
  }

  async infoAction() {
    const id = this.post('id');
    const model = this.model('test');
    const data = await model.where({id: id}).find();

    return this.success(data);
  }

  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('test');
    values.is_show = values.is_show ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }
    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');
    let origindata = this.model('test').where({id: id});
    let data = origindata.find();
    await origindata.limit(1).delete();
    // TODO 

    return this.success(data);
  }
};

