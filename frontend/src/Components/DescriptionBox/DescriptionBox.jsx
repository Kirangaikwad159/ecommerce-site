import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='discriptionbox'>
        <div className='discriptionbox-navigator'>
            <div className='discriptionbox-nav-box'>Description</div>
            <div className='discriptionbox-nav-box fade'>Reviews (122)</div>
        </div>
      <div className='descriptionbox-description'>
        <p>An e-commerce website is an online platform that facilities
            buying and selling of products of services over the internet
            serves as a virtual marketplace where business and individe
            showcase their products, interact with customers, and 
            conduct transactions without the need for a physical presence.
            E-commerce websites hava gained immense popularity due to their
            convenius accessibility, and the global reach they offer.
        </p>
        <p>
            E-commerce websites typically display products or services a detailed
            descriptions, images, prices, and available var (e.g., sizes, colors).
            Each product usually has its own dedication with relevant information.
        </p>
      </div>
    </div>
  )
}

export default DescriptionBox
