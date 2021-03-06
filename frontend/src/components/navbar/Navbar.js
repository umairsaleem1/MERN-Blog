import React from "react";
import { useRef } from "react";
import { motion, useCycle } from "framer-motion";
import { useDimensions } from "./utils/useDimensions";
import { MenuToggle } from "./utils/MenuToggle";
import { Navigation } from "./utils/Navigation";
import './navbar.css';



// sidebar variants
const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 40px 40px)`,    
    transition: {  
      type: "spring",
      stiffness: 20,
      restDelta: 2
    }
  }),
  closed: {
    clipPath: "circle(30px at 40px 40px)",
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40
    }
  }
};

const Navbar = () => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={height}
      ref={containerRef}
    >
      <motion.div className="menu-background" variants={sidebar}/>
      <Navigation open={isOpen}/>
      <MenuToggle toggle={() => toggleOpen()} />
    </motion.nav>
  );
};


export default Navbar;
