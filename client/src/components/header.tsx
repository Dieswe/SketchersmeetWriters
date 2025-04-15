import { Card, CardContent } from "@/components/ui/card";

export default function Header() {
  return (
    <Card className="shadow-md mb-6">
      <CardContent className="p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Sketchers meet Writers</h1>
        <p className="text-center text-gray-700 mb-4">
          Breng jouw creatieve werk tot leven door samenwerking. Wat wil je doen?
        </p>
      </CardContent>
    </Card>
  );
}
