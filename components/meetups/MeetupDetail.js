import classes from './MeetupDetail.module.css'; // Import the CSS module

function MeetupDetail(props) {
  return (
    <section className={classes.detail}>
      {/* Top Section - Title */}
      <div className={classes.titleSection}>
        <h1>{props.title}</h1>
      </div>

      {/* Middle Section - Image, Description, Address */}
      <div className={classes.middleSection}>
        {/* Image on the left */}
        <div className={classes.imageSection}>
          <img className={classes.image} src={props.image} alt={props.title} />
        </div>

        {/* Description and Address on the right */}
        <div className={classes.contentSection}>
          <div className={classes.descriptionSection}>
            <h2>Description</h2>
            <p>{props.description}</p>
          </div>

            <div className={classes.blank}></div>

          <div className={classes.addressSection}>
            <p>{props.addressLine1}</p>
            <p>{props.addressLine2}</p>
            <p>{props.addressLine3}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section - Tel and Email */}
      <div>
        <div className={classes.contactInfo}>
          <span>Tel: {props.telNo}</span>
          <span>Email: {props.email}</span>
        </div>
      </div>
    </section>
  );
}

export default MeetupDetail;
