import builder from '../builder'

// User type
builder.objectType('User', {
  fields: (t) => ({
    id: t.exposeString('id'),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    email: t.exposeString('email'),
    username: t.exposeString('username'),
    phone: t.exposeString('phone'),
    avatar: t.exposeString('avatar'),
    birthDate: t.exposeString('birthDate'),
    address: t.field({
      type: 'UserAddress',
      resolve: (user) => user.address,
    }),
    company: t.exposeString('company'),
    jobTitle: t.exposeString('jobTitle'),
    createdAt: t.exposeString('createdAt'),
  }),
})

// User address nested type
builder.objectType('UserAddress', {
  fields: (t) => ({
    street: t.exposeString('street'),
    city: t.exposeString('city'),
    state: t.exposeString('state'),
    zipCode: t.exposeString('zipCode'),
    country: t.exposeString('country'),
  }),
})

// Product type
builder.objectType('Product', {
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    price: t.exposeFloat('price'),
    discountPercentage: t.exposeFloat('discountPercentage'),
    rating: t.exposeFloat('rating'),
    stock: t.exposeInt('stock'),
    brand: t.exposeString('brand'),
    category: t.exposeString('category'),
    thumbnail: t.exposeString('thumbnail'),
    images: t.exposeStringList('images'),
    sku: t.exposeString('sku'),
    weight: t.exposeFloat('weight'),
    createdAt: t.exposeString('createdAt'),
  }),
})

// Post type
builder.objectType('Post', {
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    body: t.exposeString('body'),
    userId: t.exposeString('userId'),
    tags: t.exposeStringList('tags'),
    reactions: t.exposeInt('reactions'),
    views: t.exposeInt('views'),
    createdAt: t.exposeString('createdAt'),
  }),
})

// Comment type
builder.objectType('Comment', {
  fields: (t) => ({
    id: t.exposeString('id'),
    postId: t.exposeString('postId'),
    userId: t.exposeString('userId'),
    body: t.exposeString('body'),
    author: t.exposeString('author'),
    email: t.exposeString('email'),
    createdAt: t.exposeString('createdAt'),
  }),
})

// Todo type
builder.objectType('Todo', {
  fields: (t) => ({
    id: t.exposeString('id'),
    userId: t.exposeString('userId'),
    todo: t.exposeString('todo'),
    completed: t.exposeBoolean('completed'),
    priority: t.exposeString('priority'),
    dueDate: t.exposeString('dueDate'),
    createdAt: t.exposeString('createdAt'),
  }),
})

// Cart item nested type
builder.objectType('CartItem', {
  fields: (t) => ({
    productId: t.exposeString('productId'),
    title: t.exposeString('title'),
    price: t.exposeFloat('price'),
    quantity: t.exposeInt('quantity'),
    total: t.exposeFloat('total'),
    discountPercentage: t.exposeFloat('discountPercentage'),
    discountedTotal: t.exposeFloat('discountedTotal'),
    thumbnail: t.exposeString('thumbnail'),
  }),
})

// Cart type
builder.objectType('Cart', {
  fields: (t) => ({
    id: t.exposeString('id'),
    userId: t.exposeString('userId'),
    products: t.field({
      type: ['CartItem'],
      resolve: (cart) => cart.products,
    }),
    total: t.exposeFloat('total'),
    discountedTotal: t.exposeFloat('discountedTotal'),
    totalProducts: t.exposeInt('totalProducts'),
    totalQuantity: t.exposeInt('totalQuantity'),
    createdAt: t.exposeString('createdAt'),
  }),
})
