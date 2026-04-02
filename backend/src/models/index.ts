// The app now uses Mongoose for MongoDB data access.
// All models are in .mongo.ts files. No Sequelize models are used.

import User from './User.mongo';
import Place from './Place.mongo';
import Review from './Review.mongo';
import Favorite from './Favorite.mongo';
import Booking from './Booking.mongo';
import PlaceImage from './PlaceImage.mongo';
import Chat, { IChat } from './Chat.mongo';
import Message, { IMessage } from './Message.mongo';
import Notification from './Notification.mongo';
import Itinerary from './Itinerary.mongo';
import ItineraryDay from './ItineraryDay.mongo';
import ItineraryItem from './ItineraryItem.mongo';

export {
  User,
  Place,
  Review,
  Favorite,
  Booking,
  PlaceImage,
  Chat,
  IChat,
  Message,
  IMessage,
  Notification,
  Itinerary,
  ItineraryDay,
  ItineraryItem,
};