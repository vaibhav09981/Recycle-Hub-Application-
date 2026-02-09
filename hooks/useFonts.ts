import { useFonts } from 'expo-font';

export const usePoppinsFonts = () => {
  const [fontsLoaded, error] = useFonts({
    Poppins: 'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2',
    'Poppins-Bold': 'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2',
    'Poppins-SemiBold': 'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2',
    'Poppins-Medium': 'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2',
    'Poppins-Regular': 'https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2',
    'Poppins-Light': 'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2',
    'Poppins-Thin': 'https://fonts.gstatic.com/s/poppins/v22/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2',
  });

  return { fontsLoaded, error };
};
