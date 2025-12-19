import QRCode from "react-qr-code";

interface Props {
  value: string;
  size?: number;
}

export const QRCodeDisplay = ({ value, size = 128 }: Props) => {
  return (
    <div style={{ background: 'white', padding: '10px' }}>
      <QRCode value={value} size={size} />
    </div>
  );
};
