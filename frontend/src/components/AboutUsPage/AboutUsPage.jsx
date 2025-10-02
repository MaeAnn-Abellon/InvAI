import React from 'react';
import Sidebar from '../Dashboard/Sidebar';
import styled from '@emotion/styled';
import wallpaper from '../../assets/wallpaper.png'; // make sure the path is correct

const PageContainer = styled.div`
  display: flex;
`;

const AboutSection = styled.section`
  background: url(${wallpaper}) no-repeat center center;
  color: #fff;
  padding: 4rem 2rem;
  text-align: center;
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #000000;
  margin-bottom: 1rem;
`;

const SubText = styled.p`
  font-size: 1.1rem;
  max-width: 700px;
  color: #000000;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
`;

const TeamContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
`;

const TeamCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 2rem;
  width: 250px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MemberPhoto = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 2px solid #fff;
`;

const MemberName = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
  color: #000000;
`;

const Role = styled.p`
  font-size: 1rem;
  opacity: 0.85;
  color: #000000;
`;

const AboutUsPage = () => {
  return (
    <PageContainer>
      <Sidebar />
      <AboutSection>
        <Title>About Us</Title>
        <SubText>
          SmartStock is an AI-powered inventory and crowdsourcing platform for Consolatrix College.
          Our mission is to make supply replenishment smart, community-driven, and transparent.
        </SubText>

        <TeamContainer>
          <TeamCard>
            <MemberPhoto src="https://i.pinimg.com/736x/a7/ac/a4/a7aca4e180649e470e41c600822eddfc.jpg" alt="Mae" />
            <MemberName>Mae 💖 </MemberName>
            <Role> Main Developer </Role>
          </TeamCard>
          <TeamCard>
            <MemberPhoto src="https://i.pinimg.com/736x/1b/1e/c8/1b1ec821d5549d937cd0fd7ea8e38685.jpg" alt="Clove" />
            <MemberName>Clove</MemberName>
            <Role>Project Manager</Role>
          </TeamCard>
          <TeamCard>
            <MemberPhoto src="https://i.pinimg.com/736x/b9/83/30/b98330d9aa282635bfdc3f0b317dab93.jpg" alt="Iso" />
            <MemberName>Iso</MemberName>
            <Role>Tester</Role>
          </TeamCard>
          <TeamCard>
            <MemberPhoto src="https://i.pinimg.com/736x/66/f1/bf/66f1bf5aec524e2df9c1fd194d607662.jpg" alt="Gekko" />
            <MemberName>Gekko</MemberName>
            <Role>System Analyst</Role>
          </TeamCard>
        </TeamContainer>
      </AboutSection>
    </PageContainer>
  );
};

export default AboutUsPage;

// import React from 'react';
// import Sidebar from '../Dashboard/Sidebar';
// import styled from '@emotion/styled';
// import wallpaper from '../../assets/wallpaper.png'; // make sure the path is correct

// const PageContainer = styled.div`
//   display: flex;
// `;

// const AboutSection = styled.section`
//   background: url(${wallpaper}) no-repeat center center;
//   background-size: cover;
//   color: #fff;
//   padding: 4rem 2rem;
//   text-align: center;
//   min-height: 100vh;
// `;

// const Title = styled.h1`
//   font-size: 2.5rem;
//   margin-bottom: 1rem;
//   text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
// `;

// const SubText = styled.p`
//   font-size: 1.1rem;
//   max-width: 700px;
//   margin: 0 auto 2rem auto;
//   line-height: 1.6;
//   text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
// `;

// const TeamContainer = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   justify-content: center;
//   gap: 2rem;
//   margin-top: 3rem;
// `;

// const TeamCard = styled.div`
//   background: rgba(0, 0, 0, 0.5);
//   border-radius: 16px;
//   padding: 2rem;
//   width: 250px;
//   backdrop-filter: blur(10px);
//   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
// `;

// const MemberImage = styled.img`
//   width: 100px;
//   height: 100px;
//   border-radius: 50%;
//   object-fit: cover;
//   margin-bottom: 1rem;
// `;

// const MemberName = styled.h3`
//   font-size: 1.4rem;
//   margin-bottom: 0.5rem;
// `;

// const Role = styled.p`
//   font-size: 1rem;
//   opacity: 0.85;
// `;

// const AboutUsPage = () => {
//   return (
//     <PageContainer>
//       <Sidebar />
//       <AboutSection>
//         <Title>About Us</Title>
//         <SubText>
//           SmartStock is an AI-powered inventory and crowdsourcing platform for Consolatrix College.
//           Our mission is to make supply replenishment smart, community-driven, and transparent.
//         </SubText>

//         <TeamContainer>
//           <TeamCard>
//             <MemberImage src="https://i.pravatar.cc/100?img=1" alt="John Doe" />
//             <MemberName>John Doe</MemberName>
//             <Role>Project Lead</Role>
//           </TeamCard>
//           <TeamCard>
//             <MemberImage src="https://i.pravatar.cc/100?img=2" alt="Jane Smith" />
//             <MemberName>Jane Smith</MemberName>
//             <Role>Frontend Developer</Role>
//           </TeamCard>
//           <TeamCard>
//             <MemberImage src="https://i.pravatar.cc/100?img=3" alt="Mark Allen" />
//             <MemberName>Mark Allen</MemberName>
//             <Role>Backend Developer</Role>
//           </TeamCard>
//           <TeamCard>
//             <MemberImage src="https://i.pravatar.cc/100?img=4" alt="You" />
//             <MemberName>You 😉</MemberName>
//             <Role>UI Master & Life Saver</Role>
//           </TeamCard>
//         </TeamContainer>
//       </AboutSection>
//     </PageContainer>
//   );
// };

// export default AboutUsPage;
