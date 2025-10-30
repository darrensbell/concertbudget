import { Breadcrumb, Card, Typography } from "antd";
import { Link, useParams } from "react-router-dom";

const Recoupment = () => {
  const { showId } = useParams();

  return (
    <div>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/shows">Shows</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/shows/${showId}`}>Show</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Recoupment</Breadcrumb.Item>
      </Breadcrumb>
      <Typography.Title level={2}>Recoupment</Typography.Title>
      <Card>
        <p>Recoupment sheet will go here.</p>
      </Card>
    </div>
  );
};

export default Recoupment;
