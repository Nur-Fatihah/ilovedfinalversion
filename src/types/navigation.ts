import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  // Authentication Screens
  Splash: undefined;
  Login: undefined;
  Register: undefined;

  // Main Navigation
  BuyerTabs: undefined;
  SellerTabs: undefined;

  // Buyer-Specific Screens
  Home: undefined;
  Messages: undefined;
  Wishlist: undefined;
  Profile: undefined;

  // Seller-Specific Screens
  Dashboard: undefined;
  AddItem: undefined;
  EditItem: { product: any };
  SellerProfile: undefined;

  // Shared Screens
  ProductDetailScreen: { productId: string };
  Chat: { conversationId: string; recipient: string; productId?: string };
  ReportScreen: { productId: string };
  TryOnScreen: { productId: string };

  // Fallback/Error Screen
  ErrorScreen: { message?: string };
};

// Utility for route props
export type NavigationRouteProp<T extends keyof RootStackParamList> = RouteProp<RootStackParamList, T>;
