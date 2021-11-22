import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component style={{ backgroundColor: 'blue' }} {...pageProps} />
}

export default MyApp
