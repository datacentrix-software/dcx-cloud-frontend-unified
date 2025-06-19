import { useSelector } from "@/store/hooks";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import { AppState } from "@/store/store";

const Logo = () => {
  const customizer = useSelector((state: AppState) => state.customizer) || {
    isCollapse: false,
    activeMode: "light",
    TopbarHeight: 70
  };

  const getLogoPath = () => {
    return "/images/logos/DCX_Logo_White.svg";
  };

  const getAltText = () => {
    return !customizer.isCollapse ? "logo" : "dcx-logo";
  };

  const LinkStyled = styled(Link)(({ theme }) => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? "40px" : "180px",
    overflow: "hidden",
    display: "block",
    position: "relative", 
  }));

  const ImageContainer = styled('div')({
    width: '100%',
    height: '100%',
    position: 'relative',
  });

  const ImageStyled = styled(Image)(({ theme }) => ({
    objectFit: 'contain', 
    width: '100%',
    height: '100%',
  }));

  return (
    <LinkStyled href="/">
      <ImageContainer>
        <ImageStyled
          src={getLogoPath()}
          alt={getAltText()}
          fill
          priority
        />
      </ImageContainer>
    </LinkStyled>
  );
};

export default Logo;