import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { descriptions } from "./utility/FakerData";
import { faker } from "@faker-js/faker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Component Imports
import Homepage from "./pages/Homepage";
import CatPage from "./pages/CatPage";
import CheckOut from "./pages/CheckOut";
import NavBar from "./components/NavBar";
import AboutUs from "./pages/About";
import ContactUs from "./pages/Contact";
import BasketSlider from "./components/BasketSlider";
import Footer from "./components/Footer";

// API Key for the Cat API
const apiKey = import.meta.env.VITE_APP_API_KEY

export default function App() {
  // Toast notification functions
  const notifyAdd = () => toast.success("Item added to basket");
  const notifyDelete = () => toast.error("Item removed from basket");

  const [basketItems, setBasketItems] = useState([]); // This state hold the items in the basket
  const [toggleBasket, setToggleBasket] = useState(false); // This state is for toggling if the basket slider is open or closed.
  const [catData, setCatData] = useState([]); // This state holds the cat data pulled in from the API combined with the faker data.
  const [loading, setLoading] = useState(false); // Loading state for the API fetch
  const [basketTotal, setBasketTotal] = useState(0); // This state holds the total price of the basket items.

  // Function to fetch the cat data from the API
  const fetchData = async () => {
    try {
      setLoading(true); // Set the loading state to true while the data is being fetched.
      const response = await fetch(
        `https://api.thecatapi.com/v1/images/search?limit=21&has_breeds=1&api_key=${apiKey}`
      );

      if (!response.ok) {
        // If the fetch response fails, throw an error.
        throw new Error("Something went wrong fetching the data.");
      }

      const data = await response.json(); // Converting the response data to a Javascript object

      let tempCatData = []; // Initialising empty array to hold modified cat data

      for (let i = 0; i < data.length; i++) {
        // This loops through the cat data and pushes extra data from faker into it.
        tempCatData.push({
          // This is the data taken from the cat api that is displayed on the homepage.
          id: data[i].id,
          url: data[i].url,
          breed: data[i].breeds[0].name,

          // This data is added from a custom description array that we have created.
          // The descriptions were generated using ChatGPT
          description: descriptions[Math.floor(Math.random() * 20)],

          // This data is taken from the faker library
          name: faker.person.firstName(),
          sex: faker.person.sex(),
          price: Math.floor(faker.commerce.price({ min: 100, max: 1000 })),

          // This is extra data from the cat api that contains breed information
          // This data is used for the individual cat pages.
          breedDescription: data[i].breeds[0].description,
          temperament: data[i].breeds[0].temperament,
          origin: data[i].breeds[0].origin,
          life_span: data[i].breeds[0].life_span,
          wikipedia_url: data[i].breeds[0].wikipedia_url,
          indoor: data[i].breeds[0].indoor,
          weight: data[i].breeds[0].weight.metric,
          rare: data[i].breeds[0].rare,
        });
      }

      setCatData(tempCatData); // Store the modified cat data in the catData state.

      // This state is used to display a loading text while the data is being fetched.
      // It is set to false after the data has been fetched.
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetching the data inside a useEffect with an empty dependency array
    // This means that the data will only be fetched once when the component mounts.
    fetchData();
  }, []);

  // Function to toggle the basket open/close
  const handleToggleBasket = () => {
    setToggleBasket(!toggleBasket);
  };

  // Function to add an item to the basket
  const handleAddToBasket = (id, name, price, breed, imgSrc) => {
    const itemExists = basketItems.find((item) => item.id === id); // If item is already in the basket

    // If the item is not in the basket, add it to the basket.
    if (!itemExists) {
      const newItem = {
        // Create a new object containing the new item data.
        id,
        name,
        price,
        breed,
        url: imgSrc,
        quantity: 1,
      };

      setBasketItems([...basketItems, newItem]); // Add the new item to the basket.
      notifyAdd(); // Call the toast function to display a notification.
    } else {
      // If the item is already in the basket, increase the quantity by 1.
      const newBasket = basketItems.map((item) => {
        // This maps through the basket and checks if the item is already in the basket.
        // If it is in the basket, it increases the quantity by 1.
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity + 1,
          };
        }
        return item;
      });

      setBasketItems(newBasket); // Set the new basket state with the updated quantity.
      notifyAdd(); // Call the toast function to display a notification.
    }
  };

  // Function to delete an item from the basket
  const handleDeleteFromBasket = (id) => {
    // Finds the item in the basket using the item id.
    const newBasket = basketItems.filter((item) => item.id !== id);

    setBasketItems(newBasket); // Sets the new basket state with the item removed.
    notifyDelete(); // Call the toast function to display a notification.
  };

  // Function to calculate the total price of the basket items.
  const calculateTotal = useCallback(() => {
    let total = 0;

    // Map through the basket items and multiply the price by the quantity
    // Then add the total to the total variable.
    basketItems.forEach((item) => {
      total += item.price * item.quantity;

      setBasketTotal(total);
    });
  }, [basketItems]);

  useEffect(() => {
    // Call the calculateTotal function whenever the basketItems state changes.
    calculateTotal();
  }, [basketItems, calculateTotal]);

  // Function to handle the change of quantity of an item in the basket
  const changeQuantity = (id, quantity) => {
    const newBasket = basketItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          quantity: parseInt(quantity),
        };
      }
      return item;
    });

    setBasketItems(newBasket);
  };

  return (
    <>
      {/* This is the toast notification container, its set to the top-center position and closes automatically after 1.5 seconds */}
      <ToastContainer position="top-center" autoClose={1500} />
      <NavBar toggleBasket={handleToggleBasket} basketItems={basketItems} />
      <Routes>
        <Route
          path="/"
          element={
            <Homepage
              cats={catData}
              loading={loading}
              handleAddToBasket={handleAddToBasket}
            />
          }
        />
        <Route
          path="/Cats/:id"
          element={
            <CatPage catData={catData} handleAddToBasket={handleAddToBasket} />
          }
        />
        <Route path="/About" element={<AboutUs />} />
        <Route path="/Contact" element={<ContactUs />} />
        <Route
          path="/Checkout"
          element={
            <CheckOut
              basketItems={basketItems}
              basketTotal={basketTotal}
              changeQuantity={changeQuantity}
              deleteFromBasket={handleDeleteFromBasket}
            />
          }
        />
      </Routes>
      {toggleBasket && (
        <BasketSlider
          toggleBasket={handleToggleBasket}
          basketItems={basketItems}
          deleteFromBasket={handleDeleteFromBasket}
          basketTotal={basketTotal}
          changeQuantity={changeQuantity}
        />
      )}
      <Footer />
    </>
  );
}
