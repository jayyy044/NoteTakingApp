import './Loader.css'

const Loader = ({h='48', w='48'}) => {
  return (
    <span className="loader" role="status" aria-label="loading" style={{height: `${h}px`, width: `${w}px`}}></span>
  )
}

export default Loader