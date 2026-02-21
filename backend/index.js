const express = require('express');
const { sequelize, connectDB } = require('./config/connectDB');
const bcrypt = require('bcrypt');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 2000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Express App is running");
});

const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  }
});


const upload = multer({ storage });

app.use('/images', express.static('upload/images'));


app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${PORT}/images/${req.file.filename}`
  });
});


const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  new_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  old_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },     

  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

app.post('/addproduct', async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      available: true
    });

    res.status(201).json({
      success: true,
      product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Product creation failed"
    });
  }
});

app.post('/removeproduct', async (req, res) => {
  try {
    const { id } = req.body;

    const deleted = await Product.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    console.log("Product Removed");

    res.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
});



app.get('/allproducts', async (req, res) => {
  try {
    const products = await Product.findAll();

    console.log("All Products Fetched");

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
});


const Users = sequelize.define("Users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  cartData: {
    type: DataTypes.JSON,      
    allowNull: false,
    defaultValue: {},          
  },

  date: {
    type: DataTypes.DATE,     
    defaultValue: DataTypes.NOW,
  },
});


app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await Users.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Existing user found with same email address",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }

    const user = await Users.create({
      name: username,
      email,
      password: hashedPassword,
      cartData: cart,
    });

    const token = jwt.sign(
      { user: { id: user.id } },
      "secret_ecom"
    );

    res.status(201).json({
      success: true,
      token,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Wrong Email Id",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        error: "Wrong Password",
      });
    }

    const data = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(data, "secret_ecom", { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});


app.get('/newcollections', async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']], 
      limit: 8
    });

    console.log('New Collection Fetched');

    res.status(200).json({
      success: true,
      products
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new collections'
    });
  }
});


app.get('/popularwomen', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        category: 'women'
      }
    });

    const popular_in_women = products.slice(0, 4);

    console.log('Popular in women fetched');

    res.status(200).json({
      success: true,
      products: popular_in_women
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular women products'
    });
  }
});


const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Please authenticate using a valid token",
    });
  }

  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user; 
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Please authenticate using a valid token",
    });
  }
};


app.post("/addtocart", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "itemId is required",
      });
    }

    const user = await Users.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const productId = String(itemId);
    const cart = user.cartData || {};

    cart[productId] = (cart[productId] || 0) + 1;

    user.cartData = cart;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
      cartData: user.cartData,
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});



app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;

    const user = await Users.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cart = user.cartData || {};

    if (cart[itemId] && cart[itemId] > 0) {
      cart[itemId] -= 1;
    }

    user.cartData = cart;
    await user.save();

    res.json({
      success: true,
      message: "Item removed from cart",
      cartData: cart,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});


app.post("/getcart", fetchUser, async (req, res) => {
  try {
    console.log("GetCart");

    const user = await Users.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      cartData: user.cartData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});


const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();
