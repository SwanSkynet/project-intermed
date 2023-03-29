import styled from "styled-components";

const Main = (props) => {
  return <Container>
    <ShareBox>
      
    </ShareBox>
  </Container>;
};

const Container = styled.div`
  grid-area: main;
`;
const CommonCard = styled.div`
  text-align:center;
  overflow:hidden;
  margin-bottom:8 px;
  background-color:#fff;
  border-radius:5 px;
  position:relative;
  border:none;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 15%), 0 0 0 rgb(0 0 0 / 20%);
`;

const ShareBox=styled(CommonCard)`
display:flex;
flex-direction:column;
color:#ffff;
margin: 0 0 8px
background:white
`;
export default Main;