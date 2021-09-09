import React, {useState, useEffect} from 'react';
import MButton from '../../ui/MButton';
import Navbar from '../../navbar/navbar';
import tutorialScreen1 from 'images/tutorials/1.png';
import tutorialScreen2 from 'images/tutorials/2.png';
import tutorialScreen3 from 'images/tutorials/3.png';
import tutorialScreen4 from 'images/tutorials/4.png';
import './TutorialView.scss';

const TutorialView = (props) => {
  const {history} = props;

  const [activePage, setActivePage] = useState(1);

  const onNextPage = () => {
    if (activePage === 4) {
      history.push('/welcome');
    } else {
      setActivePage(activePage + 1);
    }
  };

  useEffect(() => {
    const handleKeyPress = ({code}) => {
      if (code === 'Enter') {
        onNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  }, [activePage]);

  return (
    <div className='tutorial-view'>
      <Navbar />
      <div className='tutorial-view_content'>
        <div className={`tutorial-view_content_slides show-page${activePage}`}>
          <div className='tutorial-view_content_slides_page page1'>
            <h2 className='title-lg'>You will find two types of repositories</h2>
            <div className="content page1_content">
              <img className='image image1' src={tutorialScreen1} alt="" />
              <div className="page1_labels">  
                <label className="image1_label1">ML Projects is where you<br /> put your data and run pipelines</label>
                <label className="image1_label2">"Code Repositories" to store dedicated<br/> functions for each ML stage</label>
              </div>
            </div>
          </div>

          <div className='tutorial-view_content_slides_page page2'>
            <h2 className='title-lg'>Transform your code repositories<br /> into runnable modules</h2>
            <div className="content page2_content">
              <img className='image image1' src={tutorialScreen2} alt="" />
            </div>
          </div>

          <div className='tutorial-view_content_slides_page page3'>
            <h2 className='title-lg'>Use your published modules in<br /> pipelines within your ML project</h2>
            <div className="content page3_content">
              <img className='image image1' src={tutorialScreen3} alt="" />
            </div>
          </div>

          <div className='tutorial-view_content_slides_page page4'>
            <h2 className='title-lg'>Share, reproduce and track all steps<br /> you made and choose the best performing model</h2>
            <div className="content page4_content">
              <img className='image image1' src={tutorialScreen4} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className='tutorial-view_footer'>
        <MButton type="submit" className="btn btn-primary" onClick={onNextPage}>
          Got it!
        </MButton>
        <label>(press enter)</label>
      </div>
    </div>
  );
};

TutorialView.propTypes = {

};

export default TutorialView;
